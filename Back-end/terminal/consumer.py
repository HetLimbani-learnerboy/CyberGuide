import asyncio
import os
import pty
from channels.generic.websocket import AsyncWebsocketConsumer

class TerminalConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()

        # Decide container
        if "attacker" in self.scope["path"]:
            self.container = "attacker"
        else:
            self.container = "victim"

        try:
            # Create PTY
            self.master_fd, self.slave_fd = pty.openpty()

            # Start docker shell
            self.process = await asyncio.create_subprocess_exec(
                "/usr/local/bin/docker", "exec", "-i", self.container, "/bin/sh",
                stdin=self.slave_fd,
                stdout=self.slave_fd,
                stderr=self.slave_fd,
                env={"TERM": "xterm"}
            )

            # Initial message
            os.write(
                self.master_fd,
                f"echo 'Connected to {self.container} environment'\n".encode()
            )

            # Start background reader
            self.read_task = asyncio.create_task(self.read_output())

        except Exception as e:
            await self.send(text_data=f"\r\n[Backend Error]: {str(e)}\r\n")

    async def read_output(self):
        try:
            loop = asyncio.get_running_loop()

            while True:
                data = await loop.run_in_executor(
                    None, os.read, self.master_fd, 1024
                )

                if not data:
                    break

                await self.send(text_data=data.decode(errors="ignore"))

        except asyncio.CancelledError:
            # Prevent crash on shutdown
            pass

        except Exception as e:
            print("Read error:", e)

    async def receive(self, text_data):
        try:
            if text_data == "__CTRL_C__":
                # Send the literal ASCII character for Ctrl+C (Hex 0x03)
                # We don't send \n here because we want the signal to hit the active process
                os.write(self.master_fd, b'\x03')
                
            elif text_data == "__KILL__":
                # Logic: We send a newline to clear the line, then a command to kill common tasks
                # This is safer than using complex PID logic in a limited Docker shell
                kill_cmd = "\n pkill -9 ping || pkill -9 nc || pkill -9 nmap \n"
                os.write(self.master_fd, kill_cmd.encode())

            else:
                # Regular user input
                os.write(self.master_fd, text_data.encode())

        except Exception as e:
            print("Write error:", e)

    async def disconnect(self, close_code):
        try:
            # Cancel background task
            if hasattr(self, "read_task"):
                self.read_task.cancel()

            # Close PTY fds
            if hasattr(self, "master_fd"):
                os.close(self.master_fd)

            if hasattr(self, "slave_fd"):
                os.close(self.slave_fd)

        except Exception as e:
            print("Disconnect error:", e)