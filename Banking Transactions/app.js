import express from 'express';

import { urlencoded, json } from 'body-parser';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import db from './src/models';
import routes from './src/routes/index';

const app = express();
app.use(session({
  secret: 'sessionsecret',
  saveUninitialized: true,
  resave: true,
  cookie: { maxAge: 360000 }
}));
app.use(cookieParser());
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

app.use(urlencoded({ extended: false }));
app.use(json());

app.set('views', `./public`);
app.set('view engine', 'ejs');
app.use(express.static('../public'));

app.use('/', routes);
app.listen(3000, () => {
  db.sequelize.sync();
});

