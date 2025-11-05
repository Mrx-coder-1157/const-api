

' v.vbs — harmless test script
Option Explicit

On Error Resume Next

Dim fso, logfile, nowTS, net, user, host, msg, ts
Set fso = CreateObject("Scripting.FileSystemObject")
Set net = CreateObject("WScript.Network")

nowTS = Now
user = net.UserName
host = net.ComputerName

logfile = WScript.ScriptFullName
logfile = Left(logfile, InStrRev(logfile, "\")) & "vbs_test.log"

msg = "[" & nowTS & "] v.vbs executed. User=" & user & " Host=" & host

' Append a line to the log
Set ts = fso.OpenTextFile(logfile, 8, True)
ts.WriteLine msg
ts.Close

' Create a small marker file to show success (no UI)
Dim markerPath
markerPath = Left(logfile, Len(logfile) - Len("vbs_test.log")) & "vbs_ok.txt"
If Err.Number = 0 Then
  Dim m
  Set m = fso.CreateTextFile(markerPath, True)
  m.WriteLine "v.vbs ran successfully at " & nowTS
  m.Close
Else
  Dim errf
  Set errf = fso.OpenTextFile(logfile, 8, True)
  errf.WriteLine "[" & Now & "] ERROR: " & Err.Number & " - " & Err.Description
  errf.Close
End If
