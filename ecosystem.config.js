module.exports = {
    apps: [
        {
            name: "borrow-worker",
            script: "src/features/borrow/workers/borrow_request_worker.js",
            instances: 1,
            exec_mode: "fork",
            watch: false,
            env: {
                NODE_ENV: "development"
            },
            error_file: "logs/borrow-worker-error.log",
            out_file: "logs/borrow-worker-out.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss Z"
        }
    ]
};
