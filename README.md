### Prerequisites

In order to try this out, you will need the following:

* An [Azure](https://azure.microsoft.com) Storage account, with a corresponding storage access key
* A predefined container inside this storage account, e.g. `content` (create this if needed, using the Azure Portal)
* [node.js](https://nodejs.org) installed on your machine

### Usage

Specify the following two environment variables according to your storage account data:

* `AZURE_STORAGE_ACCOUNT` with the name of your storage account, e.g. `mystorage-ab342bc`
* `AZURE_STORAGE_ACCESS_KEY` with the access key to your storage account (retrieve this from your Azure Portal)
* `AZURE_STORAGE_SAS_CONTAINER` with the name of the container you want to create SAS tokens for, e.g `content` (**Note**: This container has to exist)

To get the dependencies, run an

```
npm install
```

Start node.js using

```
node bin/www
```

The service will be available at `http://localhost:3000/bulk/token`. To retrieve a SAS token to your storage, issue the following cURL command:

```
$ curl -X POST -d '{}' http://localhost:3000/bulk/token
```

The service will return a JSON structure like this:

```
{
  "storageUrl":"https://panamastorage.blob.core.windows.net/bulkingest/6845094f-6ecb-444f-adde-71de53a2874c.zip?st=2016-01-20T08%3A40%3A02Z&se=2016-01-20T10%3A30%3A02Z&sp=rw&sv=2015-02-21&sr=b&sig=k90b%2BUUAKW7gpfyPPBZa30SogcDzv%2F8cxcYrd3C0zd4%3D",
  "filename":"6845094f-6ecb-444f-adde-71de53a2874c.zip",
  "headers": [
    {"header":"x-ms-blob-type","value":"BlockBlob"}
  ],
  "method":"PUT"
}
```

This information can subsequently be used to issue a `PUT` to the URL specified in the `storageUrl` field.

### Setting a different port

By default, the service listens to port 3000. If you want to use a different port, simply specify the port number in the `PORT` environment variable, on Windows e.g. use

```
C:\Projects\azure-storage-sas>set PORT=8080
``` 

### Using https

In case you want to enable secure http (https), additionally follow these steps before starting the node.js server:

* Put your certificates into the `ssl` folder, named `privatekey.pem` and `certificate.pem`
* Set the `AZURE_STORAGE_SAS_HTTPS` environment variable to `true`

When testing using cURL, the URL needs to point to the `https` protocol, and you may have to add the `--insecure` switch, depending on which type of certificate you are using (unfortunately, [Let's Encrypt](https://www.letsencrypt.org) certificates also still require this):

```
$ curl -X POST -d "{}" --insecure https://localhost:3000/bulk/token
```
