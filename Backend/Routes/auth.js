import express from 'express';
import { register, login , admin_seed} from '../Controllers/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/admin-seed', admin_seed); 

export default router;