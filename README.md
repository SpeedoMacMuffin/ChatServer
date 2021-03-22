# DeadNode

## Content:

1. About
2. Linked Repositories
3. Tech-Stack
4. [Installation](#installation)

## 1. About

---

DeadNode is a Web-Application running fully on a Raspberry Pi (tested and run on Zero W, 3b+, 4b+) that creates a self-contained wireless Access-Point and lets you chat and share files anonymously.

This project was inspired by the Open-Source Project [PirateBox](https://piratebox.cc/).

This is an Open-Source Project, feel free to contribute to this project!

## 2. Linked Repositories

---

[React-App](https://github.com/SpeedoMacMuffin/DeadNode-App)

[Socket.io/ChatServer](https://github.com/SpeedoMacMuffin/ChatServer)

[FileServer](https://github.com/SpeedoMacMuffin/FileServer)

[AdminServer](https://github.com/SpeedoMacMuffin/AdminServer)

## 3. Tech-Stack

---

- React.js
- Picnic CSS
- Node.js
- Express.js
- MongoDB/Mongoose
- Socket.io
- Raspbian Lite
- Raspberry Pi(Zero W, 3b+, 4b+)
- PM2
- NginX
- Hostapd
- Dnsmasq

Usage:

- The Front-End is made with React.js and styled with Picnic CSS and is divided in Chat-, Files- and Admin-Section.

- The Socket.io/ChatServer uses Socket.io, Mongoose and manages the Chat in real-time and also updates in real-time when files get uploaded or deleted and sends basic information to the Admin-Section(e.g. connected clients, file- and message-count)

- The FileServer uses Node.js, Express, Express-Fileupload and handles the upload, download, opening and deleting of files

- The AdminServer uses Node.js, Express, bcrypt, Mongoose, Raspberry-Info and manages to provide an overview of the system itself(used & available Space, CPU- & RAM-Info) and gives the opportunity to change the admin- and wireless-credentials as well as rebooting and shutting down the Raspberry Pi.

- PM2, NginX, Hostapd, Dnsmasq, RaspbianLite and Raspberry Pi are needed to create a self-contained wireless access point

## 4. <a name="installation">Installation</a>

---

In the future there will be an Image provided for an easy installation process. Until then, this takes around 15 - 20 minutes on the Pi 3b+ and 4b+. The Zero W takes a little longer.

### **_1. Raspberry Pi Setup_**

- Click on [this](https://www.raspberrypi.org/software/operating-systems/) link and select "Raspberry Pi OS Lite" and download the file.

- Put the MicroSD-Card into your PC or Laptop

- Flash the OS image to the card. If you don't have it already, [balenaEtcher](https://www.balena.io/etcher/) is an awesome tool for this and easy to use. Select the image or zip-file, select the SD-Card, Flash!

- While flashing, open the simplest text-editor you have and create an empty file called "ssh", without quotes and without any extension, e.g. ".txt".

- (Only for Zero W or if you don't have an ethernet-connection) With the same editor, create a new file called "wpa_supplicant.conf" with the following content and save the file:
  Note: replace the ssid- and psk-values with the values of your network.

```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
    ssid="Your_SSID"
    scan_ssid=1
    psk="Your_Password"
    key_mgmt=WPA-PSK
}
```

- After flashing, remove the SD-Card and put it back in. Move to the directory of your SD-Card and copy the ssh-file(and wpa_supplicant.conf if needed) into the directory. This enables ssh on your Pi, so you can download the Repositories and Packages. Now you can unmount the card and put it in the Pi.

- Plug in the Ethernet-Cable and turn on the Pi.

- In your Router configuration you should see the Raspberry Pi. Note down the IP-Address of your Pi

- Now open a Terminal(or PuTTy) and type

```
ssh pi@yourpi'sIPaddress        //e.g. ssh pi@192.168.178.59
```

- The default Password for the Raspberry Pi is "raspberry"

- To change the default Password (highly recommended!) type the command "passwd". It should look like this:

```
pi@raspberrypi:~ $ passwd
Changing password for pi.
Current password:
New password:
Retype new password:
passwd: password updated successfully
```

- Last step to set up the Pi is updating the operating system. Type:

```
$ sudo apt-get update
```

and then

```
$ sudo apt-get upgrade
```

This will take a little while, and after that, the Pi will be ready to use.

### **_2. Install Git, MongoDB, nvm_**

Run the following commands from the command-line. You can simply copy & paste and press Enter

- Install Git to be able to download the Repositories:

```
$ sudo apt-get install git
```

- Install MongoDB

```
$ sudo apt-get install mongodb
```

```
$ sudo systemctl enable mongodb
```

```
$ sudo systemctl start mongodb
```

- Install nvm(Node.js and npm)

```
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
```

then

```
$ export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

- type this to check if nvm is correctly installed. the output should be "nvm"

```
$ command -v nvm
```

- install latest stable version of Node.js on the Pi 3b+ and 4b+:

```
$ nvm install stable
```

- on the Pi Zero W:

```
$ nvm install v10
```

this installs Node.js v10. Higher versions of Node.js are not supported by the Zero W

- install PM2

```
$ npm install pm2 -g
```

### **_3. Clone Repositories, install Packages & start with PM2_**

```
$ git clone https://github.com/SpeedoMacMuffin/ChatServer && cd ChatServer && npm i && pm2 start server.js --name Socket.io && cd
```

```
$ git clone https://github.com/SpeedoMacMuffin/AdminServer && cd AdminServer && npm i && pm2 start server.js --name Admin && cd
```

```
$ git clone https://github.com/SpeedoMacMuffin/FileServer && cd FileServer && npm i && pm2 start server.js --name Files && cd
```

```
$ git clone https://github.com/SpeedoMacMuffin/DeadNode-App && cd DeadNode-App && npm i && npm run build && pm2 serve build 3000 --name DeadNode --spa && cd
```

### **_4. Run on startup_**

- To start everything on boot, type

```
$ pm2 startup
```

The output should look like this:

```
pm2 startup
$ [PM2] You have to run this command as root. Execute the following command:
$ sudo su -c env PATH=$PATH:/home/unitech/.nvm/versions/node/v4.3/bin pm2 startup <distribution> -u <user> --hp <home-path>
```

- Run the displayed command and then

```
$ pm2 save
```

- Install and configure NginX

```
$ sudo apt install nginx
```

```
$ sudo systemctl enable nginx
```

```
$ sudo nano /etc/nginx/sites-available/default
```

edit the contents of the file to look like this:

```
server {
        listen 80 default_server;
        listen [::]:80 default_server;
        root /var/www/html;
        index index.html index.htm index.nginx-debian.html;
        server_name deadnode.io;
        location / {
                proxy_pass http://192.168.4.1:3000;
        }
}
```

### **_5. Set up Access Point_**

- Install Hostapd

```
$ sudo apt install hostapd
```

- Enable access point on boot

```
$ sudo systemctl unmask hostapd

$ sudo systemctl enable hostapd
```

- Install Dnsmasq

```
$ sudo apt install dnsmasq
```

- Configure static IP

```
$ sudo nano /etc/dhcpcd.conf
```

go to the end of the file, add the text below and save

```
interface wlan0
    static ip_address=192.168.4.1/24
    nohook wpa_supplicant
```

- Rename default file and edit new one

```
$ sudo mv /etc/dnsmasq.conf /etc/dnsmasq.conf.orig
$ sudo nano /etc/dnsmasq.conf
```

Copy the following text into the file and save

```
interface=wlan0 # Listening interface
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
                # Pool of IP addresses served via DHCP
domain=wlan     # Local wireless DNS domain
address=/deadnode.io/192.168.4.1
                # Alias for this router
```

- unblock Wifi

```
$ sudo rfkill unblock wlan
```

- configure Hostapd

```
sudo nano /etc/hostapd/hostapd.conf
```

Copy the following text into the file and save

```
interface=wlan0
ssid=DeadNode
hw_mode=g
channel=7
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=ChangeMe
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
```

- run the access point and restart

```
$ sudo systemctl reboot
```

Now, finally, after rebooting you should be able to see the access point "DeadNode".

The default credentials are:

- Wifi: ChangeMe
- Admin-Section: ChangeMe

Make sure to change the passwords!
