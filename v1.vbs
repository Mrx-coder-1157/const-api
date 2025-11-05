' v_api_test.vbs — calls a public API and logs response
Option Explicit

Dim http, fso, logPath, base, response

On Error Resume Next

Set http = CreateObject("MSXML2.XMLHTTP")
Set fso  = CreateObject("Scripting.FileSystemObject")

' folder of this script
base = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))

' log file next to script
logPath = base & "api_result.log"

' MAKE API REQUEST (GET)
http.Open "GET", "https://api.ipify.org?format=json", False
http.Send

If Err.Number = 0 And http.Status = 200 Then
    response = http.responseText
Else
    response = "ERROR: " & Err.Description & " (Status=" & http.Status & ")"
End If

' Append result to log file
Dim ts
Set ts = fso.OpenTextFile(logPath, 8, True)
ts.WriteLine "[" & Now & "] " & response
ts.Close
