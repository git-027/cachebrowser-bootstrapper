function RequiredField(fieldname) {
  this.status = 400;
  this.title = "Missing required field";
  this.detail = "The field '" + fieldname + "' is required";
  this.source = fieldname;
}

function InvalidField(fieldname, reason) {
  this.status = 400;
  this.title = "Invalid value";
  this.detail = null;
  this.source = fieldname;

  if (reason) {
      this.detail = reason;
  }
}

function DatabaseError(err) {
  this.status = 500;
  this.title = "Database save error";
}

function NotFound() {
  this.status = 404;
  this.title = "Not Found";
}

var mongooseErrors = {
  'required': RequiredField,
  'default': InvalidField
}

function fromMongoose(err) {
  var errors = [];
  for (var key in err.errors) {
    // skip loop if the property is from prototype
    if (!err.errors.hasOwnProperty(key)) continue;

    var errorData = err.errors[key];
    var errorType = mongooseErrors[errorData.kind] || mongooseErrors.default;
    var error = new errorType(key, errorData.message);

    errors.push(error);
  }
  return errors;
}

module.exports = {
  RequiredField: RequiredField,
  InvalidField: InvalidField,
  DatabaseError: DatabaseError,
  NotFound: NotFound,
  fromMongoose: fromMongoose
}
