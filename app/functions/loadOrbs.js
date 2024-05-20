
import { database } from '../../firebase';
import {ref, set, get} from 'firebase/database';

import EmptyOrb from '../objects/emptyOrb';

const loadOrbs = async () => {
    try {
      const orbsRef = ref(database, ('users/' + currentUser.getUsername() + '/orbs'));
      const snapshot = await get(orbsRef);
      if (snapshot.exists()){
        const orbsData = snapshot.val();
        setOrbsArray(await Promise.all(Object.keys(orbsData)));
        setOrbsCounts(await Promise.all(Object.values(orbsData)));
        console.log('nice')
      } else{
        const emptyOrb = new EmptyOrb();
        set(orbsRef, emptyOrb)
        .then(async() => {
          console.log('initialized user orbs')
          const orbsData = snapshot.val();
        setOrbsArray(await Promise.all(Object.keys(orbsData)));
        setOrbsCounts(await Promise.all(Object.values(orbsData)));
        }).catch((error) => {
          console.error('Error initializing orb data:', error);
        });
      }
    }
    catch (error) {
      console.log('Error loading orbs:', error);
    }
  }
  export default loadOrbs;