from __future__ import annotations

import argparse
import csv
import json
from collections import Counter
from dataclasses import asdict, dataclass
from pathlib import Path
from statistics import mean, median
from typing import Any


COCO_KEYPOINTS = {
    "left_hip": 11,
    "right_hip": 12,
    "left_ankle": 15,
    "right_ankle": 16,
}


@dataclass(frozen=True)
class TrackSample:
    frame: int
    time_s: float
    track_id: int
    hip_x: float
    hip_y: float
    ankle_x: float
    ankle_y: float
    confidence: float | None


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Analyze an athlete video with YOLO pose tracking."
    )
    parser.add_argument("--video", required=True, help="Path to the athlete video")
    parser.add_argument(
        "--test",
        choices=["sprint", "vertical_jump"],
        default="sprint",
        help="Type of sports test to analyze",
    )
    parser.add_argument(
        "--output",
        default="results/analysis_result.json",
        help="Where to save the final JSON result",
    )
    parser.add_argument(
        "--csv",
        default="data/tracked_keypoints.csv",
        help="Where to save frame-by-frame tracking data",
    )
    parser.add_argument(
        "--model",
        default="yolo11n-pose.pt",
        help="YOLO pose model path or model name",
    )
    parser.add_argument(
        "--track-id",
        type=int,
        default=None,
        help="Optional athlete track id. If omitted, the longest visible track is used.",
    )
    parser.add_argument(
        "--distance-m",
        type=float,
        default=None,
        help="Known sprint distance in meters, for example 50.",
    )
    parser.add_argument(
        "--meters-per-pixel",
        type=float,
        default=None,
        help="Calibration scale for jump height or pixel-to-meter conversion.",
    )
    args = parser.parse_args()

    try:
        samples = extract_tracking_samples(
            video_path=Path(args.video),
            model_name=args.model,
        )
    except ModuleNotFoundError as exc:
        print_missing_dependency_help(exc)
        return 1

    if not samples:
        raise SystemExit("No tracked athlete keypoints were found in the video.")

    write_samples_csv(samples, Path(args.csv))

    selected_track_id = args.track_id or choose_main_track(samples)
    athlete_samples = [sample for sample in samples if sample.track_id == selected_track_id]

    if args.test == "sprint":
        result = analyze_sprint(
            athlete_samples,
            distance_m=args.distance_m,
            meters_per_pixel=args.meters_per_pixel,
        )
    else:
        result = analyze_vertical_jump(
            athlete_samples,
            meters_per_pixel=args.meters_per_pixel,
        )

    result.update(
        {
            "test_type": args.test,
            "video": str(Path(args.video)),
            "selected_track_id": selected_track_id,
            "tracked_keypoints_csv": str(Path(args.csv)),
            "sample_count": len(athlete_samples),
        }
    )

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")

    print(f"Saved keypoints CSV: {args.csv}")
    print(f"Saved analysis JSON: {args.output}")
    print(json.dumps(result, indent=2))
    return 0


def extract_tracking_samples(video_path: Path, model_name: str) -> list[TrackSample]:
    try:
        import cv2
        from ultralytics import YOLO
    except ModuleNotFoundError:
        raise

    if not video_path.exists():
        raise SystemExit(f"Video not found: {video_path}")

    model = YOLO(model_name)
    cap = cv2.VideoCapture(str(video_path))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0:
        raise SystemExit("Could not read FPS from the video.")

    samples: list[TrackSample] = []
    frame_number = 0

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        results = model.track(
            frame,
            persist=True,
            tracker="bytetrack.yaml",
            verbose=False,
        )
        result = results[0]

        if (
            result.keypoints is not None
            and result.boxes is not None
            and result.boxes.id is not None
        ):
            keypoints_xy = result.keypoints.xy.cpu().numpy()
            keypoints_conf = _keypoint_confidences(result.keypoints)
            track_ids = result.boxes.id.int().cpu().tolist()

            for person_index, (person_keypoints, track_id) in enumerate(
                zip(keypoints_xy, track_ids)
            ):
                samples.append(
                    make_sample(
                        frame_number=frame_number,
                        fps=fps,
                        track_id=track_id,
                        keypoints=person_keypoints,
                        confidences=(
                            keypoints_conf[person_index]
                            if keypoints_conf is not None
                            else None
                        ),
                    )
                )

        frame_number += 1

    cap.release()
    return samples


def make_sample(
    frame_number: int,
    fps: float,
    track_id: int,
    keypoints: Any,
    confidences: Any | None,
) -> TrackSample:
    left_hip = keypoints[COCO_KEYPOINTS["left_hip"]]
    right_hip = keypoints[COCO_KEYPOINTS["right_hip"]]
    left_ankle = keypoints[COCO_KEYPOINTS["left_ankle"]]
    right_ankle = keypoints[COCO_KEYPOINTS["right_ankle"]]

    confidence = None
    if confidences is not None:
        confidence = float(
            mean(
                [
                    confidences[COCO_KEYPOINTS["left_hip"]],
                    confidences[COCO_KEYPOINTS["right_hip"]],
                    confidences[COCO_KEYPOINTS["left_ankle"]],
                    confidences[COCO_KEYPOINTS["right_ankle"]],
                ]
            )
        )

    return TrackSample(
        frame=frame_number,
        time_s=frame_number / fps,
        track_id=int(track_id),
        hip_x=float((left_hip[0] + right_hip[0]) / 2),
        hip_y=float((left_hip[1] + right_hip[1]) / 2),
        ankle_x=float((left_ankle[0] + right_ankle[0]) / 2),
        ankle_y=float((left_ankle[1] + right_ankle[1]) / 2),
        confidence=confidence,
    )


def _keypoint_confidences(keypoints: Any) -> Any | None:
    if getattr(keypoints, "conf", None) is None:
        return None
    return keypoints.conf.cpu().numpy()


def choose_main_track(samples: list[TrackSample]) -> int:
    counts = Counter(sample.track_id for sample in samples)
    return counts.most_common(1)[0][0]


def analyze_sprint(
    samples: list[TrackSample],
    distance_m: float | None,
    meters_per_pixel: float | None,
) -> dict[str, Any]:
    if len(samples) < 2:
        raise SystemExit("Need at least two tracked samples for sprint analysis.")

    samples = sorted(samples, key=lambda sample: sample.time_s)
    duration_s = samples[-1].time_s - samples[0].time_s
    if duration_s <= 0:
        raise SystemExit("Tracked sprint duration was zero.")

    displacement_px = abs(samples[-1].hip_x - samples[0].hip_x)
    average_pixel_speed = displacement_px / duration_s

    result: dict[str, Any] = {
        "duration_sec": round(duration_s, 3),
        "horizontal_displacement_px": round(displacement_px, 3),
        "average_pixel_speed_px_s": round(average_pixel_speed, 3),
        "mean_keypoint_confidence": rounded_mean_confidence(samples),
    }

    if distance_m is not None:
        result["distance_m"] = distance_m
        result["average_speed_mps"] = round(distance_m / duration_s, 3)

    if meters_per_pixel is not None:
        result["horizontal_displacement_m"] = round(
            displacement_px * meters_per_pixel, 3
        )

    return result


def analyze_vertical_jump(
    samples: list[TrackSample],
    meters_per_pixel: float | None,
    baseline_fraction: float = 0.2,
) -> dict[str, Any]:
    if len(samples) < 3:
        raise SystemExit("Need at least three tracked samples for jump analysis.")

    samples = sorted(samples, key=lambda sample: sample.time_s)
    baseline_count = max(1, round(len(samples) * baseline_fraction))
    baseline_y = median(sample.hip_y for sample in samples[:baseline_count])
    apex = min(samples, key=lambda sample: sample.hip_y)
    jump_height_px = max(0.0, baseline_y - apex.hip_y)

    result: dict[str, Any] = {
        "jump_height_px": round(jump_height_px, 3),
        "baseline_hip_y_px": round(baseline_y, 3),
        "apex_hip_y_px": round(apex.hip_y, 3),
        "apex_time_sec": round(apex.time_s, 3),
        "mean_keypoint_confidence": rounded_mean_confidence(samples),
    }

    if meters_per_pixel is not None:
        result["jump_height_m"] = round(jump_height_px * meters_per_pixel, 3)

    return result


def rounded_mean_confidence(samples: list[TrackSample]) -> float | None:
    confidences = [
        sample.confidence for sample in samples if sample.confidence is not None
    ]
    if not confidences:
        return None
    return round(mean(confidences), 3)


def write_samples_csv(samples: list[TrackSample], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=list(asdict(samples[0]).keys()))
        writer.writeheader()
        for sample in samples:
            writer.writerow(asdict(sample))


def print_missing_dependency_help(error: ModuleNotFoundError) -> None:
    missing = error.name or "a Python package"
    print(f"Missing dependency: {missing}")
    print("Install the ML requirements first:")
    print("  py -m pip install -r python\\ai_analysis\\requirements.txt")


if __name__ == "__main__":
    raise SystemExit(main())
