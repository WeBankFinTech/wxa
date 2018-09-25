export const descriptorGenerator = (des)=>{
    return {
        enumerable: true,
        writable: true,
        configurable: true,
        ...des,
    };
};

export let methodDescriptorGenerator = (name, fn, placement='prototype')=>{
    return {
        key: name,
        kind: 'method',
        placement,
        descriptor: descriptorGenerator({value: fn}),
    };
};

export let classFactory = (name, fn)=>{
    return function(classDescriptor) {
        let {elements} = classDescriptor;

        return {
            ...classDescriptor,
            elements: elements.concat([methodDescriptorGenerator(name, fn)]),
        };
    };
};
