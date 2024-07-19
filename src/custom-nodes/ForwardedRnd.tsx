import React, { forwardRef } from 'react';
import { Rnd } from 'react-rnd';

const ForwardedRnd = forwardRef<Rnd, React.ComponentProps<typeof Rnd>>((props, ref) => {
    return <Rnd {...props} ref={ref} />;
});

export default ForwardedRnd;
