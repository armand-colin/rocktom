yarn install
yarn build
sudo rm -rf /var/www/rocktom.armandcolin.fr/*
sudo cp -r dist/* /var/www/rocktom.armandcolin.fr/
sudo cp -r public /var/www/rocktom.armandcolin.fr/
sudo systemctl reload nginx
echo "Deployed!"