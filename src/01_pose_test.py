from ultralytics import YOLO

# Load pretrained pose model
model = YOLO("yolo11n-pose.pt")

# Analyze the video
results = model(
    "videos/sprint.mp4",
    save=True,
    project="outputs",
    name="pose_test"
)

print("Pose analysis complete!")