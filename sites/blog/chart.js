var azure = require('azure');
var ServiceClient = azure.ServiceClient;
var TableQuery = azure.TableQuery;
var uuid = require('node-uuid');

var tableName = 'charts';
var partition = 'part1';

Chart = function () {
  this.tableClient = azure.createTableService(ServiceClient.DEVSTORE_STORAGE_ACCOUNT, ServiceClient.DEVSTORE_STORAGE_ACCESS_KEY, ServiceClient.DEVSTORE_TABLE_HOST);
};

Chart.prototype.findAll = function (callback) {
  var tableQuery = TableQuery.select()
    .from(tableName);

  this.tableClient.queryEntities(tableQuery, callback);
};

Chart.prototype.findById = function (id, callback) {
  this.tableClient.queryEntity(tableName, partition, id, callback);
};

/* Blog.prototype.destroy = function (id, callback) {
  var entity = { PartitionKey: partition, RowKey: id };
  this.tableClient.deleteEntity(tableName, entity, callback);
}; */

/* Blog.prototype.save = function (posts, callback) {
  if (!Array.isArray(posts)) {
    posts = [posts];
  }

  this.savePosts(posts, callback);
}; */

// this could be implemented using batch but for the sake of using both methods use the individual requests + callback.
/* Blog.prototype.savePosts = function (posts, callback) {
  if (posts.length === 0) {
    callback();
  }
  else {
    var post = posts.pop();
    post.created_at = new Date();

    if (post.comments === undefined)
      post.comments = [];

    for (var j = 0; j < post.comments.length; j++) {
      post.comments[j].created_at = new Date();
    }

    post.PartitionKey = partition;
    post.RowKey = uuid();

    var provider = this;
    this.tableClient.insertEntity(tableName, post, function () {
      // Insert remaining posts recursively
      provider.savePosts(posts, callback);
    });
  }
}; */

Chart.prototype.init = function () {
  var provider = this;
  this.tableClient.createTableIfNotExists(tableName, function (err, created) {
    if (created) {
      console.log('Setting up demo data ...');

      provider.tableClient.beginBatch();

      var now = new Date().toString();
      provider.tableClient.insertEntity(tableName, { PartitionKey: partition, RowKey: uuid(), title: 'Chart one', body: 'Body one', created_at: now });
      provider.tableClient.insertEntity(tableName, { PartitionKey: partition, RowKey: uuid(), title: 'Chart two', body: 'Body two', created_at: now });
      provider.tableClient.insertEntity(tableName, { PartitionKey: partition, RowKey: uuid(), title: 'Chart three', body: 'Body three', created_at: now });
      provider.tableClient.insertEntity(tableName, { PartitionKey: partition, RowKey: uuid(), title: 'Chart four', body: 'Body four', created_at: now });

      provider.tableClient.commitBatch(function () {
        console.log('Done');
      });
    }
  });
};

exports.Chart = Chart;
