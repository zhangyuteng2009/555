sudo $(cd "$(dirname "$0")"; pwd)/jvm/macos_java11/bin/java -javaagent:$(cd "$(dirname "$0")"; pwd)/console.jar -cp $(cd "$(dirname "$0")"; pwd)/console.jar com.x.server.console.swapcommand.Exit
