from ultralytics import YOLO

VIDEO_PATH = "videos/50msprint.mp4"

model = YOLO("yolo11n-pose.pt")

model.track(
    source=VIDEO_PATH,
    tracker="bytetrack.yaml",
    persist=True,
    save=True,
    project="outputs",
    name="sprint_tracking"
)

print("Tracking complete!")