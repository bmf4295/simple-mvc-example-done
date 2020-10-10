const models = require('../models');

// get the Cat model
const Cat = models.Cat.CatModel;
const Dog = models.Dog.DogModel;

const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};
const defaultDogData = {
  name: 'unknown',
  breed: 'unknown',
  age: 0,
};

let lastAdded = new Cat(defaultData);
let lastAddedDog = new Dog(defaultDogData);

const hostIndex = (req, res) => {
  res.render('index', {
    currentName: lastAdded.name,
    title: 'Home',
    pageName: 'Home Page',
  });
};

const readAllCats = (req, res, callback) => {
  Cat.find(callback).lean();
};

const readAllDogs = (req, res, callback) => {
  Dog.find(callback).lean();
};

const readCat = (req, res) => {
  const name1 = req.query.name;

  // function to call when we get objects back from the database.
  // With Mongoose's find functions, you will get an err and doc(s) back
  const callback = (err, doc) => {
    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }

    // return success
    return res.json(doc);
  };

  // Call the static function attached to CatModels.
  // This was defined in the Schema in the Model file.
  // This is a custom static function added to the CatModel
  // Behind the scenes this runs the findOne method.
  // You can find the findByName function in the model file.
  Cat.findByName(name1, callback);
};

const readDog = (req, res) => {
  const name1 = req.query.name;

  const callback = (err, doc) => {
    if (err) {
      return res.status(500).json({ err });
    }

    // return success
    return res.json(doc);
  };

  Dog.findByName(name1, callback);
};

const hostPage1 = (req, res) => {
  const callback = (err, docs) => {
    if (err) {
      return res.status(500).json({ err });
    }

    // return success
    return res.render('page1', { cats: docs });
  };

  readAllCats(req, res, callback);
};

const hostPage2 = (req, res) => {
  res.render('page2');
};

const hostPage3 = (req, res) => {
  res.render('page3');
};
const hostPage4 = (req, res) => {
  const callback = (err, docs) => {
    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }

    // return success
    return res.render('page4', { dogs: docs });
  };

  readAllDogs(req, res, callback);
};

const getName = (req, res) => {
  res.json({ name: lastAdded.name });
};

const getDogName = (req, res) => {
  res.json({ name: lastAddedDog.name });
};

const setName = (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    return res.status(400).json({ error: 'firstname,lastname and beds are all required' });
  }

  // if required fields are good, then set name
  const name = `${req.body.firstname} ${req.body.lastname}`;

  // dummy JSON to insert into database
  const catData = {
    name,
    bedsOwned: req.body.beds,
  };

  // create a new object of CatModel with the object to save
  const newCat = new Cat(catData);

  // create new save promise for the database
  const savePromise = newCat.save();

  savePromise.then(() => {
    // set the lastAdded cat to our newest cat object.
    // This way we can update it dynamically
    lastAdded = newCat;
    // return success
    res.json({ name: lastAdded.name, beds: lastAdded.bedsOwned });
  });

  // if error, return it
  savePromise.catch((err) => res.status(500).json({ err }));

  return res;
};

const setDogName = (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.breed || !req.body.age) {
    return res.status(400).json({ error: 'firstname,lastname, breed, and age are all required' });
  }

  const name = `${req.body.firstname} ${req.body.lastname}`;

  const dogData = {
    name,
    breed: req.body.breed,
    age: req.body.age,
  };

  const newDog = new Dog(dogData);

  const savePromise = newDog.save();

  savePromise.then(() => {
    lastAddedDog = newDog;

    res.json({ name: lastAddedDog.name, breed: lastAddedDog.breed, age: lastAddedDog.age });
  });

  savePromise.catch((err) => res.status(500).json({ err }));

  return res;
};

const searchName = (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  return Cat.findByName(req.query.name, (err, doc) => {
    // errs, handle them
    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }

    if (!doc) {
      return res.json({ error: 'No cats found' });
    }

    // if a match, send the match back
    return res.json({ name: doc.name, beds: doc.bedsOwned });
  });
};
const searchDogName = (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }
  return Dog.findByName(req.query.name, (err, doc) => {
    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }
    if (!doc) {
      return res.json({ error: 'No dog found' });
    }
    const foundDog = doc;

    foundDog.age++;

    const savePromise = foundDog.save();

    const dogFound = savePromise.then(
      () => res.json({ name: foundDog.name, breed: foundDog.breed, age: foundDog.age }),
    );

    savePromise.catch((err2) => res.status(500).json({ err2 }));

    return dogFound;
  });
};

const updateLast = (req, res) => {
  lastAdded.bedsOwned++;

  const savePromise = lastAdded.save();

  savePromise.then(() => res.json({ name: lastAdded.name, beds: lastAdded.bedsOwned }));

  // if save error, just return an error for now
  savePromise.catch((err) => res.status(500).json({ err }));
};

const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

// export the relevant public controller functions
module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  readCat,
  readDog,
  getName,
  getDogName,
  setName,
  setDogName,
  updateLast,
  searchName,
  searchDogName,
  notFound,
};
