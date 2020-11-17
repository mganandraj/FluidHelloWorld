import subprocess
import time
import os
from datetime import datetime
import re

# RN_REUSE, RN_NEW, WEBVIEW
MODE = "WEBVIEW" 
ITERATIONS=10

DEVICE_ID="R38M407P64Z"
ADB_PATH="e:\\nugetcache\\androidsdk.29.0.1\\platform-tools\\adb.exe"

totalPSSPattern = re.compile("^\\s*TOTAL:\\s*(\\d+).*")
javaHeapPattern = re.compile("^\\s*Java Heap:\\s*(\\d+).*")
nativeHeapPattern = re.compile("^\\s*Native Heap:\\s*(\\d+).*")
privateOtherPattern = re.compile("^\\s*Private Other:\\s*(\\d+).*")

totalPSSList = []
javaHeapList = []
nativeHeapList = []
privateOtherList = []

webViewSandbox_totalPSSList = []
webViewSandbox_javaHeapList = []
webViewSandbox_nativeHeapList = []
webViewSandbox_privateOtherList = []

def getAdbCmd(subCmds):
    adbCmd = [ADB_PATH]
    if(len(DEVICE_ID) > 0):
        adbCmd.extend(["-s", DEVICE_ID])

    adbCmd.extend(subCmds)
    return adbCmd

def execute(cmd, output_dump):
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    for line in p.stdout.readlines():
        output_dump.write(line.decode("utf-8"))

def settle():
    time.sleep(2)

def settleLong():
    time.sleep(10)

def stopApp(output_dump):
  execute(getAdbCmd(["shell", "am", "force-stop", "com.fluidhelloworld"]), output_dump)  

def startApp(output_dump):
  execute(getAdbCmd(["shell", "am", "start", "-n", "com.fluidhelloworld/.MultiActivity"]), output_dump)

def newDice(mode, output_dump):
    execute(getAdbCmd(["shell", "am", "broadcast", "-a", "com.fluidhelloworld.NEW_DICE", "--es", "mode", mode]), output_dump)

def prepareSummary(lines, output_summary):
    
    for line in lines:
        match = totalPSSPattern.match(line)
        if(match):
            totalPSSList.append(match.group(1))

        match = javaHeapPattern.match(line)
        if(match):
            javaHeapList.append(match.group(1))

        match = nativeHeapPattern.match(line)
        if(match):
            nativeHeapList.append(match.group(1))

        match = privateOtherPattern.match(line)
        if(match):
            privateOtherList.append(match.group(1))
            

def dumpSys(output_dump, output_summary):
    p = subprocess.Popen(getAdbCmd(["shell", "dumpsys", "meminfo", "-a", "com.fluidhelloworld"]), stdout=subprocess.PIPE)
    lines = []
    for line in p.stdout.readlines():
        lines.append(line.decode("utf-8"))

    for line in lines:
        output_dump.write(line)

    prepareSummary(lines, output_summary)


def getAllWebviewPIDs(output_dump):
    
    # NOTE: We rely on process name which may change across Android versions.
    # On my Samsung S10 with Android-10 : "com.google.android.webview:sandboxed_process"
    # On my x86 VM with Android v26 : "com.android.chrome:sandboxed_process"
    #
    # USER           PID  PPID     VSZ    RSS WCHAN            ADDR S NAME
    # u0_i9380     21149  2181 1503172  41592 0                   0 S com.google.android.webview:sandboxed_process0:org.chromium.content.app.SandboxedProcessService0:0
    pattern = re.compile("^\\s*[a-zA-Z0-9_-]+\\s*(\d+).*com.google.android.webview:sandboxed_process.*")
    webviewPIDs = []
    p = subprocess.Popen(getAdbCmd(["shell", "ps", "-A"]), stdout=subprocess.PIPE)
    for line in p.stdout.readlines():
        output_dump.write(line.decode("utf-8"))
        match = pattern.match(line.decode("utf-8"))
        if(match):
            webviewPIDs.append(match.group(1))

    return webviewPIDs

def Diff(li1, li2):
    return (list(list(set(li1)-set(li2)) + list(set(li2)-set(li1))))

def dumpSysWebviewSandbox(otherwebviewPIDs, output_dump, output_summary):

    webViewPIDs = getAllWebviewPIDs(output_dump)
    ourwebViewPID = Diff(webViewPIDs, otherwebviewPIDs)

    if(len(ourwebViewPID) != 1):
        output_dump.write("We expect exactly one new webview sandbox !")
        exit(1)

    p = subprocess.Popen(getAdbCmd(["shell", "dumpsys", "meminfo", ourwebViewPID[0]]), stdout=subprocess.PIPE)
    lines = []
    for line in p.stdout.readlines():
        lines.append(line.decode("utf-8"))

    for line in lines:
        output_dump.write(line)

    for line in lines:
        match = totalPSSPattern.match(line)
        if(match):
            webViewSandbox_totalPSSList.append(match.group(1))

        match = javaHeapPattern.match(line)
        if(match):
            webViewSandbox_javaHeapList.append(match.group(1))

        match = nativeHeapPattern.match(line)
        if(match):
            webViewSandbox_nativeHeapList.append(match.group(1))

        match = privateOtherPattern.match(line)
        if(match):
            webViewSandbox_privateOtherList.append(match.group(1))

def writeSummary(output_summary):
    for pss in totalPSSList:
        output_summary.write("Total PSS \t " + pss + "\n")

    output_summary.write("\n")

    for javaHeap in javaHeapList:
        output_summary.write("Java Heap \t " + javaHeap + "\n")

    output_summary.write("\n")

    for nativeHeap in nativeHeapList:
        output_summary.write("Native Heap \t " + nativeHeap + "\n")

    output_summary.write("\n")

    for privateOther in privateOtherList:
        output_summary.write("Private Other \t " + privateOther + "\n")

    output_summary.write("\n")

# Webview sandbox

    for pss in webViewSandbox_totalPSSList:
        output_summary.write("Webview Sandbox Total PSS \t " + pss + "\n")

    output_summary.write("\n")

    for javaHeap in webViewSandbox_javaHeapList:
        output_summary.write("Webview Sandbox Java Heap \t " + javaHeap + "\n")

    output_summary.write("\n")

    for nativeHeap in webViewSandbox_nativeHeapList:
        output_summary.write("Webview Sandbox Native Heap \t " + nativeHeap + "\n")

    output_summary.write("\n")

    for privateOther in webViewSandbox_privateOtherList:
        output_summary.write("Webview Sandbox Private Other \t " + privateOther + "\n")

def run(mode, output_dump, output_summary):
    if(mode == "RN_REUSE"):
        output_dump.write("React Native Views with instance reuse.\n\n")
        output_summary.write("React Native Views with instance reuse.\n\n")
    elif(mode == "RN_NEW"):
        output_dump.write("React Native Views with new instances.\n\n")
        output_summary.write("React Native Views with new instances.\n\n")
    elif(mode == "WEBVIEW"):
        output_dump.write("Web Views.\n\n")
        output_summary.write("Web Views.\n\n")
    else:
        output_dump.write("Unknown run mode.\n\n")
        output_summary.write("Unknown run mode.\n\n")
        exit(1)

    
    stopApp(output_dump)
    settle()

    # remember preexisting webview sandboxes
    otherwebviewPIDs = getAllWebviewPIDs(output_dump)

    startApp(output_dump)
    settle()
    settle()

    # Initial state
    dumpSys(output_dump, output_summary)

    for n in range(ITERATIONS): #pylint: disable=unused-variable
        settle()
        newDice(mode, output_dump)
        settleLong()
        dumpSys(output_dump, output_summary)
        
        if(mode == "WEBVIEW"):
            dumpSysWebviewSandbox(otherwebviewPIDs, output_dump, output_summary)

    settle()
    writeSummary(output_summary)    

def main():
    scriptFolder = os.path.dirname(os.path.realpath(__file__))
    perfFolderPath = os.path.join(scriptFolder, "PerfFiles-" + datetime.now().strftime("%m_%d_%H_%M_%S"))
    os.mkdir(perfFolderPath)

    with open(os.path.join(perfFolderPath, 'dump.txt'), 'w') as output_dump:
        with open(os.path.join(perfFolderPath, 'summary.txt'), 'w') as output_summary:
            run(MODE, output_dump, output_summary)


# ADB_PATH="e:\\nugetcache\\androidsdk.29.0.1\\platform-tools\\adb.exe"
# with open('output.txt', 'w') as output_dump:
# subprocess.call([ADB_PATH, "shell", "am", "start", "-n", "com.fluidhelloworld/.MultiActivity"])

# for n in range(5):
#     time.sleep(5)
#     subprocess.call([ADB_PATH, "shell", "am", "broadcast", "-a", "com.fluidhelloworld.NEW_DICE", "--es", "mode", "RN_REUSE"])

if __name__ == "__main__":
    main()
