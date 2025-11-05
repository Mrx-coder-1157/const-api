' v.vbs - minimal safe test
Option Explicit

Dim fso, base, logPath, okPath, ts
Set fso = CreateObject("Scripting.FileSystemObject")

' folder of this script
base = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))

' log + marker files
logPath = base & "vbs_test.log"
okPath  = base & "vbs_ok.txt"

' append one line to log
Set ts = fso.OpenTextFile(logPath, 8, True)
ts.WriteLine Now & " - v.vbs executed OK"
ts.Close

' write a small marker file
Set ts = fso.CreateTextFile(okPath, True)
ts.WriteLine "OK at " & Now
ts.Close
