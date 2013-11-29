# Add explicit hostname to URLs in head, banner, topNav and footer

s|src="/images/footericons|src="http://www.environment.nsw.gov.au/images/footericons|g
s|src="/images/admin|src="http://www.environment.nsw.gov.au/images/admin|g
s|/favicon.ico|http://www.environment.nsw.gov.au/favicon.ico|g
s|action="/|action="http://www.environment.nsw.gov.au/|g
s|value="/|value="http://www.environment.nsw.gov.au/|g

s|href="/|href="http://www.environment.nsw.gov.au/|g

# Undo added hostname from references to virtual folder /css/decc
s|href="http://www.environment.nsw.gov.au/css/decc/|href="/css/decc/|g
