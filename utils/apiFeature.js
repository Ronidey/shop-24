class ApiFeature {
  constructor(query, restQuery) {
    this.query = query;
    this.restQuery = restQuery;
  }

  filter() {
    const queryObj = { ...this.restQuery };
    const fieldsToExclude = ['sort', 'page', 'limit', 'fields', 'search'];
    fieldsToExclude.forEach((f) => delete queryObj[f]);

    if (this.restQuery.search) {
      queryObj.title = new RegExp(this.restQuery.search, 'i');
    }

    this.query = this.query.find(queryObj);
    return this;
  }

  sort() {
    if (this.restQuery.sort) {
      const sortBy = this.restQuery.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  select() {
    if (this.restQuery.fields) {
      const fields = this.restQuery.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = this.restQuery.page * 1 || 1;
    const limit = this.restQuery.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeature;
