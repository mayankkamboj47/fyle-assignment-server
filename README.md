# Fyle server

This server takes urls of the form : `<root url>?username=<username>&page=<page>` and returns repositories of the said user
with pagination. 

To count the number of repositories the user has (capped to 100), make a request to `/size/<username>`. 

The frontend of this website is on [vercel](https://fyle-assignment.vercel.app) and [github](https://www.github.com/mayankkamboj47/fyle-assignment)

