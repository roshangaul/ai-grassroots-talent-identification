from ultralytics import YOLO
import cv2
import csv

VIDEO_PATH = "videos/sprint.mp4"
OUTPUT_PATH = "data/sprint_keypoints.csv"

model = YOLO("yolo11n-pose.pt")

cap = cv2.VideoCapture(VIDEO_PATH)

fps = cap.get(cv2.CAP_PROP_FPS)
frame_number = 0

rows = []

while True:
    ret, frame = cap.read()

    if not ret:
        break

    results = model(frame, verbose=False)

    # Get pose keypoints
    if results[0].keypoints is not None:
        keypoints = results[0].keypoints.xy.cpu().numpy()

        if len(keypoints) > 0:
            # For now, use the first detected person
            person = keypoints[0]

            row = {
                "frame": frame_number,
                "time": frame_number / fps,
            }

            # COCO keypoint indices:
            # 11 = left hip
            # 12 = right hip
            # 13 = left knee
            # 14 = right knee
            # 15 = left ankle
            # 16 = right ankle

            row["left_hip_x"] = person[11][0]
            row["left_hip_y"] = person[11][1]

            row["right_hip_x"] = person[12][0]
            row["right_hip_y"] = person[12][1]

            row["left_ankle_x"] = person[15][0]
            row["left_ankle_y"] = person[15][1]

            row["right_ankle_x"] = person[16][0]
            row["right_ankle_y"] = person[16][1]

            rows.append(row)

    frame_number += 1

cap.release()

with open(OUTPUT_PATH, "w", newline="") as f:

    fieldnames = rows[0].keys()

    writer = csv.DictWriter(f, fieldnames=fieldnames)

    writer.writeheader()
    writer.writerows(rows)

print(f"FPS: {fps}")
print(f"Frames processed: {frame_number}")
print(f"Keypoint data saved to: {OUTPUT_PATH}")