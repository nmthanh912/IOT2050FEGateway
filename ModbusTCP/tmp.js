const a = () => {
    for (let i = 1;  i < 10; i*=2) {
        if (i === 4) {
            break
        }

        console.log(i)
    }
}

a()