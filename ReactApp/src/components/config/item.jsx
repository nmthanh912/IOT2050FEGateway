import React, { useState } from 'react';

function Item({ children }) {
  const [expand, setExpand] = useState(false);

  return <div className='mb-2'>
    {React.cloneElement(children[0], {
      expand: expand,
      setExpand: setExpand,
    })}
    {React.cloneElement(children[1], { expand: expand })}
  </div>
};

const Header = props => {
  return <div>

  </div>;
}
Item.Header = Header

const Body = props => {
  return <div>

  </div>
}
Item.Body = Body

export default Item;