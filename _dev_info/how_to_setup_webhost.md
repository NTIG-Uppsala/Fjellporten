# How to setup webhost on fjellporten.ntig.dev

1. Open CMD
2. Type SSH connection string: ssh root@ntig.dev -p 62039
3. Type password
4. Type apt update
5. Then apt upgrade
6. Then type apt install nginx
7. Cd to nginx with cd /etc/nginx/
8. Cd to sites-available with cd sites-available/
9. Go into nano default by typing nano default in cmd
10. Go to server line and change listen from 80 to 3000
11. Then add website after root /var/www/html; to this /var/www/html/website;
12. Then restart nginx by typing systemctl restart nginx
13. Cd into html by typing cd /var/www/html/
14. Then type ls to see all files in html
15. Type rm index to remove the autocreated index file in html
16. Install git by typing apt-get install git-all
17. Then update git by typing apt-get update
18. Use git clone to clone repository by typing git clone https://github.com/NTIG-Uppsala/Fjellporten .

# How to setup webhost on fjellportendev.ntig.dev

1. Open CMD
2. Type SSH connection string: ssh root@ntig.dev -p 62038
3. Type password
4. Type apt update
5. Then apt upgrade
6. Then type apt install nginx
7. Cd to nginx with cd /etc/nginx/
8. Cd to sites-available with cd sites-available/
9. Go into nano default by typing nano default in cmd
10. Go to server line and change listen from 80 to 3000
11. Then add website after root /var/www/html; to this /var/www/html/website;
12. Then restart nginx by typing systemctl restart nginx
13. Cd into html by typing cd /var/www/html/
14. Then type ls to see all files in html
15. Type rm index to remove the autocreated index file in html
16. Install git by typing apt-get install git-all
17. Then update git by typing apt-get update
18. Use git clone to clone repository by typing git clone https://github.com/NTIG-Uppsala/Fjellporten .

---
[Go back to README.md](../README.md)
