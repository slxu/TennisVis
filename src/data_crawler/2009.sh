( find . -iname '201[01234]*' | cut -d '_' -f 2;find . -iname '2009*' | cut -d '_' -f 2) | sort | uniq 
