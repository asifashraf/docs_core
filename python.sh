# Install python 3 on mac m3

brew install python3

# check python version

python --version

# check pip version

pip --version

python3 -m venv docenv

# activate the virtual environment

source docenv/bin/activate

# check if the virtual environment is activated

which python

# install package mkdocs

pip install mkdocs

# check mkdocs version

mkdocs --version

# install mkdocs-material
pip install mkdocs-material
pip install mkdocs-awesome-pages-plugin


# run current dicrectory as mkdocs

mkdocs serve -a 0.0.0.0:8888

