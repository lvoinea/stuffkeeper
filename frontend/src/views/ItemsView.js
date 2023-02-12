import React, {useEffect, useState} from 'react';
import {getItems} from '../services/backend';

export default function ItemsView() {
  const [items, setItems] = useState([]);

  useEffect(() => {
   getItems()
   .then(data =>
     setItems(data)
   );
  }, [])

  return(
  <React.Fragment>
    <h2>Items</h2>
    <ul>
        {items.map(item =>
            <li>
                Tool: {item.name}
            </li>
        )}
    </ul>
   </React.Fragment>
  );
}