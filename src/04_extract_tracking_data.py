from ultralytics import YOLO
import cv2
import pandas as pd

VIDEO_PATH = "videos/sprint.mp4"
OUTPUT_PATH = "data/tracked_keypoints.csv"

model = YOLO("yolo11n-pose.pt")

cap = cv2.VideoCapture(VIDEO_PATH)

fps = cap.get(cv2.CAP_PROP_FPS)

rows = []
frame_number = 0

while True:
    ret, frame = cap.read()

    if not ret:
        break

    results = model.track(
        frame,
        persist=True,
        tracker="bytetrack.yaml",
        verbose=False
    )

    result = results[0]

    # Make sure we detected people and have tracking IDs
    if (
        result.keypoints is not None
        and result.boxes is not None
        and result.boxes.id is not None
    ):
        keypoints = result.keypoints.xy.cpu().numpy()
        track_ids = result.boxes.id.int().cpu().tolist()

        for person_keypoints, track_id in zip(keypoints, track_ids):

            # COCO pose indices
            left_hip = person_keypoints[11]
            right_hip = person_keypoints[12]

            left_ankle = person_keypoints[15]
            right_ankle = person_keypoints[16]

            # Center of both hips
            hip_x = (left_hip[0] + right_hip[0]) / 2
            hip_y = (left_hip[1] + right_hip[1]) / 2

            # Center of both ankles
            ankle_x = (left_ankle[0] + right_ankle[0]) / 2
            ankle_y = (left_ankle[1] + right_ankle[1]) / 2

            rows.append({
                "frame": frame_number,
                "time": frame_number / fps,
                "track_id": track_id,
                "hip_x": hip_x,
                "hip_y": hip_y,
                "ankle_x": ankle_x,
                "ankle_y": ankle_y
            })

    frame_number += 1

cap.release()

df = pd.DataFrame(rows)

df.to_csv(OUTPUT_PATH, index=False)

print(f"FPS: {fps:.2f}")
print(f"Frames processed: {frame_number}")
print(f"Rows collected: {len(df)}")
print(f"Saved to: {OUTPUT_PATH}")

print("\nTracked athletes:")
print(df["track_id"].unique())