#!/bin/bash
# Copyright (c) http://www.o2oa.net/
current_dir="$(cd "$(dirname "$0")"; pwd)"
if [ -d ${current_dir}/local/update ]
then
	for D in commons configSample localSample jvm servers store config  local
	do
		if [ ! -d ${current_dir}/$D ]
		then
			mkdir ${current_dir}/commons
		fi
	done
	if [ -f ${current_dir}/local/update/o2server/version.o2 ]
	then
		echo 'update o2server.'
		for D in commons configSample localSample jvm servers store
		do
			if [ -d ${current_dir}/local/update/o2server/$D ]
			then
				echo "update ${current_dir}/$D."
				cp -Rf -p ${current_dir}/local/update/o2server/$D  ${current_dir}/
			fi
		done
		for F in console.jar index.html src.zip
		do
			if [ -f ${current_dir}/local/update/o2server/$F ]
			then
				echo "update ${current_dir}/$F."
				cp -f -p ${current_dir}/local/update/o2server/$F ${current_dir}/
			fi
		done
		for A in "start" "stop" "restart" "console" "service"
		do
			for B in "_windows.bat" "_linux.sh" "_macos.sh" "_arm.sh" "_mips.sh" "_raspi.sh" "_aix.sh"
			do
				if [ -f ${current_dir}/local/update/o2server/$A$B ]; then
					echo "update ${current_dir}/$A$B."
					cp -f -p ${current_dir}/local/update/o2server/$A$B ${current_dir}/
				fi
			done
		done
		echo "update ${current_dir}/version.o2."
		cp ${current_dir}/local/update/o2server/version.o2 ${current_dir}/
		echo "clean local/update directory."
		rm -Rf ${current_dir}/local/update
		echo "the update is complete, please restart the server."
		exit 1
	fi
fi
setsid ${current_dir}/jvm/aix_java11/bin/java -Dnashorn.args=--no-deprecation-warning --add-exports jdk.scripting.nashorn/jdk.nashorn.internal.runtime=ALL-UNNAMED --add-exports jdk.scripting.nashorn/jdk.nashorn.internal.runtime.arrays=ALL-UNNAMED --add-opens java.base/java.lang=ALL-UNNAMED -javaagent:${current_dir}/console.jar -server -Djava.awt.headless=true -Xms2g -Duser.timezone=GMT+08 -XX:+HeapDumpOnOutOfMemoryError -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.ssl=false -Dcom.sun.management.jmxremote.port=1099 -Dcom.sun.management.jmxremote.authenticate=false -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=20000 -Djava.rmi.server.hostname=127.0.0.1 -jar ${current_dir}/console.jar
