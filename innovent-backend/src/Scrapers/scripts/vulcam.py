#!/usr/bin/env python3

import re
import requests
import json
import sys
from fake_useragent import UserAgent
from countries import countries_data

class ScanCameras:
    def __init__(self, country_code, headers):
        self.country_code = country_code.upper()
        self.base_url = "http://www.insecam.org/en/bycountry"
        self.headers = headers

    def get_cameras(self):
        request = requests.get(f"{self.base_url}/{self.country_code}/", headers=self.headers)

        if request.status_code == 404:
            return {"error": "No cameras found for this country."}

        try:
            last_page = int(re.findall(r'pagenavigator\("\?page=", (\d+)', request.text)[0])
        except IndexError:
            last_page = 1  # If there's only one page

        camera_ips = []
        for page in range(last_page):
            status = requests.get(f"{self.base_url}/{self.country_code}/?page={page}", headers=self.headers)
            ip_addresses = re.findall(r"http://\d+\.\d+\.\d+\.\d+:\d+", status.text)
            camera_ips.extend(ip_addresses)

        return {"country": self.country_code, "cameras": camera_ips}

if __name__ == "__main__":
    user_agent = UserAgent()
    headers = {"User-Agent": user_agent.chrome}

    if len(sys.argv) != 2:
        print(json.dumps({"error": "Country code required"}))
        sys.exit(1)

    country_code = sys.argv[1]
    scanner = ScanCameras(country_code, headers)
    print(json.dumps(scanner.get_cameras()))
