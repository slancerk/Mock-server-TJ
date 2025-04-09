## 🚀 Running the Mock Server

To build and run the mock server, use the provided script:

```bash
./rebuild-mock-server.sh
```
## 🔄 What this script does:

*Creates a .env file from example.env (if not already present).
Stops and removes any existing mock-server Docker container.
Removes the old Docker image for mock-server (if any).
Builds a fresh Docker image.
Runs the mock server on port 3003.*

🔐 Permissions
If you're running this script for the first time or get a "Permission denied" error, make it executable with:

```bash
chmod +x rebuild-mock-server.sh
```


✅ Summary of cURL Tests

| **Test**                          | **Command Example** |
|-----------------------------------|---------------------|
| **No Auth** | `curl -X GET "http://localhost:3000/data"` |
| **Basic Auth** | `curl -X PUT "http://localhost:3000/data" -u admin:password` |
| **Bearer Token** | `curl -X POST "http://localhost:3000/data" -H "Authorization: Bearer $TOKEN"` |
| **OAuth2 - Auth Code Flow** | `curl -X GET "http://localhost:3000/authorize?client_id=myclient&redirect_uri=http://localhost/callback&state=xyz"` |
| **OAuth2 - Token Exchange** | `curl -X POST "http://localhost:3000/token" -H "Content-Type: application/x-www-form-urlencoded" -d "code=mock_code&client_id=myclient&client_secret=mysecret&audience=my_audience"` |
| **JSON Content-Type** | `curl -X POST "http://localhost:3000/data" -H "Content-Type: application/json" -d '{"message": "Test"}'` |
| **Plain Text** | `curl -X POST "http://localhost:3000/data" -H "Content-Type: text/plain" --data "Test"` |
| **HTML Content-Type** | `curl -X POST "http://localhost:3000/data" -H "Content-Type: text/html" --data "<h1>Test</h1>"` |
| **XML Content-Type** | `curl -X POST "http://localhost:3000/data" -H "Content-Type: text/xml" --data "<message>Test</message>"` |
| **Form-URLEncoded** | `curl -X POST "http://localhost:3000/data" -H "Content-Type: application/x-www-form-urlencoded" -d "message=Test"` |
| **Multipart File Upload** | `curl -X POST "http://localhost:3000/upload" -H "Content-Type: multipart/form-data" -F "file=@/path/to/file.jpg"` |
| **Query Params** | `curl -X GET "http://localhost:3000/data?param1=value1&param2=value2"` |
| **Send Cookies** | `curl -X GET "http://localhost:3000/data" -b "sessionid=12345; username=admin"` |
| **Store Cookies** | `curl -X GET "http://localhost:3000/data" -c cookies.txt` |
| **Use Stored Cookies** | `curl -X GET "http://localhost:3000/data" -b cookies.txt` |
