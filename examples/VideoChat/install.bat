@ECHO OFF
IF NOT EXIST "%WMSAPP_HOME%\conf\videochat\Application.xml" ( 
		echo Installing VideoChat...
		xcopy "%WMSAPP_HOME%\examples\VideoChat\conf" "%WMSAPP_HOME%\conf" /s  /Y  /Q > NUL
	) else (
		echo Skipping VideoChat.  Already configured.	
	)
IF NOT EXIST "%WMSAPP_HOME%\applications\videochat" mkdir "%WMSAPP_HOME%\applications\videochat"
IF NOT "%1" == "all" (
	echo If Wowza Streaming Engine is running, you must restart it to see the installed examples.
	pause
	)
