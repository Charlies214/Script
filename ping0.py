import requests
from bs4 import BeautifulSoup
import warnings
import re

warnings.simplefilter('ignore', requests.packages.urllib3.exceptions.InsecureRequestWarning)

def get_ip_info(ip_address):
    url = f"https://ping0.cc/ip/{ip_address}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0"
    }
    
    response = requests.get(url, headers=headers, verify=False)
    
    if response.status_code != 200:
        print(f"请求失败，状态码: {response.status_code}")
        return None

    jskey_match = re.search(r"window\.x\s*=\s*'([^']+)'", response.text)
    if jskey_match:
        jskey = jskey_match.group(1)
    else:
        print("未找到 jskey")
        return None

    cookies = {"jskey": jskey}
    response = requests.get(url, headers=headers, cookies=cookies, verify=False)
    
    if response.status_code != 200:
        print(f"请求失败，状态码: {response.status_code}")
        return None

    soup = BeautifulSoup(response.content, "html.parser")

    ip_type_element = soup.find("div", class_="line line-iptype").find("div", class_="content")
    ip_type = ip_type_element.text.strip() if ip_type_element else None

    native_ip_element = soup.find("div", class_="line line-nativeip").find("div", class_="content")
    native_ip = native_ip_element.text.strip() if native_ip_element else None

    asn_owner_element = soup.find("div", class_="line asnname").find("div", class_="content")
    asn_owner = asn_owner_element.text.strip() if asn_owner_element else None

    risk_item = soup.find("div", class_="riskitem riskcurrent") 

    if risk_item:
        risk_score = risk_item.find("span", class_="value").text.strip() if risk_item.find("span", class_="value") else None
        risk_label = risk_item.find("span", class_="lab").text.strip() if risk_item.find("span", class_="lab") else None
    else:
        risk_score, risk_label = None, None

    return {
        "ip_type": ip_type,
        "native_ip": native_ip,
        "asn_owner": asn_owner,
        "risk_score": risk_score,
        "risk_label": risk_label
    }

ip_address = "157.254.231.49"
ip_info = get_ip_info(ip_address)

if ip_info:
    print(f"IP地址: {ip_address}")
    
    ip_types = [t.strip() for t in ip_info['ip_type'].split('\n') if t.strip()]
    print(f"IP类型: {', '.join(ip_types)}") 
    
    native_ips = [t.strip() for t in ip_info['native_ip'].split('\n') if t.strip()]
    print(f"原生 IP: {', '.join(native_ips)}")
    
    asn_owner_parts = ip_info['asn_owner'].split("—")
    asn_name = asn_owner_parts[0].strip()
    
    asn_domain_match = re.search(r"\(([^)]+)\)", asn_owner_parts[1]) if len(asn_owner_parts) > 1 else None
    asn_domain = asn_domain_match.group(1) if asn_domain_match else ""
    
    idc_label = ""
    if "IDC" in asn_name:
        idc_label = "(IDC)"
        asn_name = asn_name.replace("IDC", "").strip()

    print(f"ASN 所有者: {asn_name} {idc_label} {asn_domain}") # 去掉 "—"
    
    print(f"风险评分: {ip_info['risk_score']}")
    print(f"风险等级: {ip_info['risk_label']}")
else:
    print(f"无法获取IP地址 {ip_address} 的信息。")