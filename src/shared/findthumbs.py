import requests
import re

with open("allmaps.ts", "w") as out:
    with open("allmaps.ts") as f:
        for line in f.readlines():
            out.write(line)

            for match in re.finditer(r"mapFile: \"([^\"]+)\",", line):

                response = requests.get(f"https://wiki.portal2.sr/api.php?action=query&titles=File:Map_{match.group(1)}.jpg&prop=imageinfo&format=json&iiprop=url",
                                        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"})

                json = response.json()

                print(match.group(1))
                print(json)

                pages = json["query"]["pages"]
                imageUrl = pages[list(pages.keys())[0]]["imageinfo"][0]["url"]

                print(imageUrl)

                out.write(f"        thumbnailUrl: \"{imageUrl}\",\n")


