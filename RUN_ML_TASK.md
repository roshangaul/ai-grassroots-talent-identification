# Running the ML Task

You do not need to memorize commands. Use this simple flow.

## First Time Setup

Open PowerShell in the project folder and run:

```powershell
py -m pip install -r python\ai_analysis\requirements.txt
```

If Windows says `No installed Python found`, install Python 3.11 or newer from
https://www.python.org/downloads/ and tick `Add python.exe to PATH` during setup.

This installs YOLO, OpenCV, Pandas, and Matplotlib.

## Sprint Video

1. Create a folder named `videos`.
2. Put your sprint video inside it.
3. Rename the video to `sprint.mp4`.
4. Double-click `run_sprint_analysis.bat`.

The script creates:

- `data/tracked_keypoints.csv`
- `results/sprint_result.json`

## Manual Command

If you want to run it yourself:

```powershell
py python\ai_analysis\analyze_video.py --video videos\sprint.mp4 --test sprint --distance-m 50 --output results\sprint_result.json --csv data\tracked_keypoints.csv
```

For a vertical jump video:

```powershell
py python\ai_analysis\analyze_video.py --video videos\jump.mp4 --test vertical_jump --output results\jump_result.json --csv data\jump_keypoints.csv
```

## What To Submit

For your ML task, the important output is `results/sprint_result.json`. It contains the selected athlete track, duration, movement in pixels, average pixel speed, and real speed if you provide `--distance-m`.
