import React from 'react';

const CustomSelect = React.forwardRef((props, ref) => {
    return (
        <select ref={ref} {...props}>
            {props.children}
        </select>
    );
});

CustomSelect.displayName = 'CustomSelect';

export default CustomSelect;
