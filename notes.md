1. create ec2 instance
2. in instance creation tab, generate a key pair. The private key will be downloaded to your local machine.
3. `ssh -i path-to-private-key ubuntu@ip`

- if you run into a permission error, `chmod 400 /Users/albertchang/Downloads/sample-hono-be-key-pair.pem`

4. `sudo apt update && sudo apt upgrade -y`
5. `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -`
6. `sudo apt install -y nodejs`
7. `node -v && npm -v`
8. `ssh-keygen -t ed25519 -C "a89529294@hotmail.com"`
9. `cat ~/.ssh/id_ed25519.pub`, copy and paste this to github
10. cd to desired location and `git clone ...`
11. cd into cloned app.

- `sudo corepack enable pnpm`
- `pnpm i`

12. `npm install -g pm2`
13. Assuming there is a start script.

- `cd path-to-app`,
- `pm2 start npm --name "hono-app" -- run start`
- `pm2 list`
- `pm2 save`
- `pm2 startup`

14. `sudo apt install -y nginx`
