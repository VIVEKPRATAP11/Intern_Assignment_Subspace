import express, { Router } from 'express';
import { fetchData , searchData } from '../Controllers/index.js';


const router = express.Router();


router.get('/blog-stats',fetchData);
router.get('/blog-search',searchData);


export default router;