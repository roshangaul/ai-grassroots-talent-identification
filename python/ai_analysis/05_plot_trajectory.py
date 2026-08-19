import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("data/tracked_keypoints.csv")

# Select the main athlete
athlete = df[df["track_id"] == 1].copy()

print("Frames:", len(athlete))
print("Time:", athlete["time"].min(), "to", athlete["time"].max())

plt.figure(figsize=(10, 6))

plt.plot(
    athlete["hip_x"],
    athlete["hip_y"],
    marker=".",
    markersize=2
)

plt.xlabel("X position (pixels)")
plt.ylabel("Y position (pixels)")
plt.title("Athlete Hip Trajectory")
plt.gca().invert_yaxis()

plt.show()