import pandas as pd
df = pd.read_csv('backend/data/models/training_calibration_dataset.csv')
print(f"Total Records: {len(df)}")
print(f"Delayed Projects: {len(df[df['is_delayed'] == 1])}")
print(f"On-Time Projects: {len(df[df['is_delayed'] == 0])}")
print(f"Projects with Disputes (Index > 0): {len(df[df['historical_dispute_index'] > 0])}")
print(f"Average Delay (Months): {df[df['is_delayed'] == 1]['delay_duration_months'].mean():.1f}")
print(f"States Covered: {df['state'].nunique()}")
