import os

print("Current Working Directory:", os.getcwd())
print("Directory contents len:", len(os.listdir(".")))
try:
    with open("test_file_write.txt", "w") as f:
        f.write("hello world")
    print("Normal write succeeded!")
except Exception as e:
    import traceback
    print("Error during open('test_file_write.txt', 'w'):")
    traceback.print_exc()
