import ctypes
from ctypes import wintypes
import os

kernel32 = ctypes.windll.kernel32

GENERIC_WRITE = 0x40000000
GENERIC_READ = 0x80000000
FILE_SHARE_READ = 1
FILE_SHARE_WRITE = 2
CREATE_ALWAYS = 2
OPEN_ALWAYS = 4
FILE_ATTRIBUTE_NORMAL = 0x80

target = os.path.abspath("test_win32.txt")
print("Target:", target)

handle = kernel32.CreateFileW(
    target,
    GENERIC_WRITE,
    FILE_SHARE_READ | FILE_SHARE_WRITE,
    None,
    CREATE_ALWAYS,
    FILE_ATTRIBUTE_NORMAL,
    None
)

err = kernel32.GetLastError()
print(f"Handle: {handle}, LastError: {err} ({ctypes.FormatError(err).strip()})")
if handle != -1 and handle != 0:
    kernel32.CloseHandle(handle)
    os.remove(target)
