import { Directus, Auth } from '@directus/sdk';
import credential from '../utils/apiCredential.js';

const directus = new Directus(credential.baseURL);

export default directus
