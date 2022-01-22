# what does this do?
it convers mysql tne balances to gems economy

# is my data safe?
this won't alter neither your ``data.yml`` file or your database info, it is a read-only tool; for the exception of the ``data.imported.yml`` file that will get created. balance dance within ``data.imported.yml`` of any given user will be replaced by the balance from tne's db if present on the ``data.yml`` too.

# how can I do it?
first, install ``nodejs``, then install the dependencies by navigating to the folder where you downloaded this project and executing ``npm install``, then execute the script with ``node .\convert.js <data.yml path> <host> <port> <database> <username> <password> <table_prefix>``

- ``data.yml path``: the path to your ``data.yml`` file (gems economy). make sure you use yaml first; you can convert it to db later
- ``host``: mysql host where your tne data is located
- ``port``: usually 3306
- ``database``: database name
- ``username``: mysql username
- ``password``: mysql user password
- ``table_prefix``: tne's prefix

example:
``node .\convert.js .\exampleData.yml '127.0.0.1' '3306' 'purevanilla' 'amazinguser' 'awesomepassword' 'prefix'``

# what should I do afterwards?
you should remove your old ``data.yml`` file and rename ``data.imported.yml`` to ``data.yml``. you can optionally import the yml file to your db using ``/currency convert`` in-game; make sure gems economy starts up with yaml before swithing to mysql so it is able to read the yml file.