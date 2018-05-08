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
                      users[userID]
                        ? resolve(users[userID])
                        : reject({
                            error: 'User with ' + userID + ' not found.',
                          }),
                  );
            });
        },
    };
};
