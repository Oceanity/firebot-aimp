import os from "os";

// export function getPlayerMetadata(
//   player: PlayerInfo,
//   prefix: string = "aimpPlayer"
// ): Record<string, string> {
//   const output: Record<string, string> = {};

//     duration: number;
//     mute: boolean;
//     position: number;
//     repeat: boolean;
//     shuffle: boolean;
//     state: PlaybackState;
//   const definitions: [string, string][] = [
//     ["Position", ""

//   ]
// }

export function getCoverArtAddress(coverId: string | null): string | null {
  if (!coverId) {
    return null;
  }

  const ip = getLocalIpAddress();

  return ip ? `http://${ip}:7472/plugins/oceanity/aimp/cover/${coverId}` : null;
}

export function getLocalIpAddress(): string | null {
  try {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName of Object.keys(networkInterfaces)) {
      const addresses = networkInterfaces[interfaceName];
      for (const address of addresses ?? []) {
        // Look for IPv4 addresses that are not internal (loopback)
        if (address.family === "IPv4" && !address.internal) {
          return address.address;
        }
      }
    }
  } catch {}
  return null;
}
