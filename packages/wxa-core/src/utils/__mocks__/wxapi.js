const users = {
    4: {name: 'Mark'},
    5: {name: 'Paul'},
    10: {name: 'Ives'},
};

export default function() {
    return {
        request(options) {
            return new Promise((resolve, reject)=>{
                const userID = parseInt(options.url.substr('/users/'.length), 10);
                process.nextTick(
                    () =>
                        userID < 0 ? resolve({statusCode: 404}) :
                            users[userID]
                            ? resolve({statusCode: 200, data: users[userID]})
                            : reject({
                                statusCode: 200,
                                error: 'User with ' + userID + ' not found.',
                            }),
                  );
            });
        },
    };
};
