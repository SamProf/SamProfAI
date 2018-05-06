var math_helper_1 = require('../../../helpers/math-helper');
var WorldModel = (function () {
    function WorldModel(settings) {
        var _this = this;
        this.settings = settings;
        this.map = [];
        this.commands = [];
        this.bots = [];
        this.dataDxDyLongByAngle = [
            [0, -2],
            [1, -2],
            [2, -2],
            [2, -1],
            [2, 0],
            [2, 1],
            [2, 2],
            [1, 2],
            [0, 2],
            [-1, 2],
            [-2, 2],
            [-2, 1],
            [-2, 0],
            [-2, -1],
            [-2, -2],
            [-1, -2],
        ];
        this.dataDxDyByAngle = [
            [0, -1],
            [1, -1],
            [1, 0],
            [1, 1],
            [0, 1],
            [-1, 1],
            [-1, 0],
            [-1, -1],
        ];
        this.addCommand(8, function (bot, cmd) {
            // step
            var x, y;
            _a = _this.getXYByAngle(bot, cmd * 45), x = _a[0], y = _a[1];
            var cell = _this.map[y][x];
            switch (cell.type) {
                case WorldCellType.poison: {
                    bot.health = 0;
                    bot.addCommandAddr(1);
                    break;
                }
                case WorldCellType.wall: {
                    bot.addCommandAddr(2);
                    break;
                }
                case WorldCellType.bot: {
                    bot.addCommandAddr(3);
                    break;
                }
                case WorldCellType.eating: {
                    bot.health += 10;
                    _this.map[bot.y][bot.x].type = WorldCellType.empty;
                    _this.currentEating--;
                    bot.x = x;
                    bot.y = y;
                    cell.type = WorldCellType.bot;
                    cell.bot = bot;
                    bot.addCommandAddr(4);
                    break;
                }
                case WorldCellType.empty: {
                    _this.map[bot.y][bot.x].type = WorldCellType.empty;
                    bot.x = x;
                    bot.y = y;
                    cell.type = WorldCellType.bot;
                    cell.bot = bot;
                    bot.addCommandAddr(5);
                    break;
                }
            }
            return true;
            var _a;
        });
        this.addCommand(8, function (bot, cmd) {
            // Grab or convert poison
            var x, y;
            _a = _this.getXYByAngle(bot, cmd * 45), x = _a[0], y = _a[1];
            var cell = _this.map[y][x];
            switch (cell.type) {
                case WorldCellType.poison: {
                    _this.map[y][x].type = WorldCellType.eating;
                    _this.currentEating++;
                    _this.currentPoison--;
                    bot.addCommandAddr(1);
                    break;
                }
                case WorldCellType.wall: {
                    bot.addCommandAddr(2);
                    break;
                }
                case WorldCellType.bot: {
                    bot.addCommandAddr(3);
                    break;
                }
                case WorldCellType.eating: {
                    bot.health += 10;
                    cell.type = WorldCellType.empty;
                    _this.currentEating--;
                    bot.addCommandAddr(4);
                    break;
                }
                case WorldCellType.empty: {
                    bot.addCommandAddr(5);
                    break;
                }
            }
            return false;
            var _a;
        });
        this.addCommand(8, function (bot, cmd) {
            // see
            var x, y;
            _a = _this.getXYByAngle(bot, cmd * 45), x = _a[0], y = _a[1];
            var cell = _this.map[y][x];
            switch (cell.type) {
                case WorldCellType.poison: {
                    bot.addCommandAddr(1);
                    break;
                }
                case WorldCellType.wall: {
                    bot.addCommandAddr(2);
                    break;
                }
                case WorldCellType.bot: {
                    bot.addCommandAddr(3);
                    break;
                }
                case WorldCellType.eating: {
                    bot.addCommandAddr(4);
                    break;
                }
                case WorldCellType.empty: {
                    bot.addCommandAddr(5);
                    break;
                }
            }
            return false;
            var _a;
        });
        if (this.settings.longSee) {
            this.addCommand(16, function (bot, cmd) {
                // see
                var dx, dy;
                var x, y;
                _a = _this.dataDxDyLongByAngle[(((cmd * 45) + bot.angle) % 360) / 45], dx = _a[0], dy = _a[1];
                _b = _this.getXYByDxDy(bot, dx, dy), x = _b[0], y = _b[1];
                var cell = _this.map[y][x];
                switch (cell.type) {
                    case WorldCellType.poison: {
                        bot.addCommandAddr(1);
                        break;
                    }
                    case WorldCellType.wall: {
                        bot.addCommandAddr(2);
                        break;
                    }
                    case WorldCellType.bot: {
                        bot.addCommandAddr(3);
                        break;
                    }
                    case WorldCellType.eating: {
                        bot.addCommandAddr(4);
                        break;
                    }
                    case WorldCellType.empty: {
                        bot.addCommandAddr(5);
                        break;
                    }
                }
                return false;
                var _a, _b;
            });
        }
        this.addCommand(8, function (bot, cmd) {
            // rotate
            bot.angle = (bot.angle + cmd * 45) % 360;
            bot.addCommandAddr(1);
            return false;
        });
        this.addCommand(settings.botMemoryLength, function (bot, cmd) {
            // jump
            bot.addCommandAddr(cmd);
            return false;
        });
    }
    WorldModel.prototype.addCommand = function (count, func) {
        // var firstIndex = 0;
        // if (this.commands.length) {
        //   firstIndex = this.commands[this.commands.length - 1].index;
        // }
        // var index = firstIndex + count;
        // var cmd = new WorldCommand();
        // cmd.firstIndex = firstIndex;
        // cmd.index = index;
        // cmd.func = func;
        // this.commands.push(cmd);
        var firstIndex = this.commands.length;
        var index = firstIndex + count;
        var cmd = new WorldCommand();
        cmd.firstIndex = firstIndex;
        cmd.index = index;
        cmd.func = func;
        for (var i = 0; i < count; i++) {
            this.commands.push(cmd);
        }
    };
    WorldModel.prototype.prepare = function (gens) {
        this.stepIndex = 0;
        this.clear();
        this.createBots(gens);
        this.createWall();
        this.createEating();
        this.createPoison();
    };
    WorldModel.prototype.step = function () {
        this.liveBotsCount = 0;
        var liveBots = [];
        this.stepIndex++;
        this.createEating();
        this.createPoison();
        for (var iBot = 0; iBot < this.bots.length; iBot++) {
            var bot = this.bots[iBot];
            if (!bot.isDead) {
                var currentCommand = 0;
                while (currentCommand++ < 10) {
                    var command = bot.getCommand();
                    var cmd = this.commands[command];
                    if (cmd.func(bot, command - cmd.firstIndex)) {
                        break;
                    }
                }
                bot.health--;
                if (bot.isDead) {
                    this.map[bot.y][bot.x].type = WorldCellType.eating;
                    this.currentEating++;
                }
                else {
                    this.liveBotsCount++;
                }
                bot.health = Math.min(bot.health, 100);
            }
            else {
                bot.health--;
            }
        }
    };
    WorldModel.prototype.getXYByAngle = function (bot, angle) {
        angle = ((bot.angle + angle) % 360);
        var dx, dy;
        _a = this.dataDxDyByAngle[angle / 45], dx = _a[0], dy = _a[1];
        return this.getXYByDxDy(bot, dx, dy);
        var _a;
    };
    WorldModel.prototype.getXYByDxDy = function (bot, dx, dy) {
        var x = (bot.x + dx) % this.settings.width;
        if (x < 0) {
            x = x + this.settings.width;
        }
        var y = (bot.y + dy) % this.settings.height;
        if (y < 0) {
            y = y + this.settings.height;
        }
        return [x, y];
    };
    WorldModel.prototype.createBots = function (gens) {
        this.bots = [];
        for (var i = 0; i < gens.length; i++) {
            var x, y, flag;
            var bot = new WorldBotState(gens[i]);
            _a = this.getEmptyCell(-1), x = _a[0], y = _a[1], flag = _a[2];
            bot.x = x;
            bot.y = y;
            bot.angle = (math_helper_1.MathHelper.getRandomInt(0, 8) * 45) % 360;
            this.map[y][x].type = WorldCellType.bot;
            this.map[y][x].bot = bot;
            this.bots.push(bot);
        }
        this.liveBotsCount = this.bots.length;
        var _a;
    };
    WorldModel.prototype.getEmptyCell = function (tryCount) {
        if (tryCount === void 0) { tryCount = 100; }
        while (tryCount != 0) {
            var x = math_helper_1.MathHelper.getRandomInt(0, this.settings.width);
            var y = math_helper_1.MathHelper.getRandomInt(0, this.settings.height);
            if (this.map[y][x].type == WorldCellType.empty) {
                return [x, y, true];
            }
            tryCount--;
        }
        return [-1, -1, false];
    };
    WorldModel.prototype.createEating = function () {
        while (this.currentEating / (this.settings.height * this.settings.width) < this.settings.eatingPercent) {
            var x, y, flag;
            _a = this.getEmptyCell(), x = _a[0], y = _a[1], flag = _a[2];
            if (flag) {
                this.map[y][x].type = WorldCellType.eating;
                this.currentEating++;
            }
            else {
                break;
            }
        }
        var _a;
    };
    WorldModel.prototype.createPoison = function () {
        while (this.currentPoison / (this.settings.height * this.settings.width) < this.settings.poisonPercent) {
            var x, y, flag;
            _a = this.getEmptyCell(), x = _a[0], y = _a[1], flag = _a[2];
            if (flag) {
                this.map[y][x].type = WorldCellType.poison;
                this.currentPoison++;
            }
            else {
                break;
            }
        }
        var _a;
    };
    WorldModel.prototype.createWall = function () {
        while (this.currentWall / (this.settings.height * this.settings.width) < this.settings.wallPercent) {
            var x, y, flag;
            _a = this.getEmptyCell(), x = _a[0], y = _a[1], flag = _a[2];
            if (flag) {
                this.map[y][x].type = WorldCellType.wall;
                this.currentWall++;
            }
            else {
                break;
            }
        }
        var _a;
    };
    WorldModel.prototype.clear = function () {
        this.currentEating = 0;
        this.currentPoison = 0;
        this.currentWall = 0;
        this.map = [];
        for (var y = 0; y < this.settings.height; y++) {
            var row = [];
            for (var x = 0; x < this.settings.width; x++) {
                row.push(new WorldCellModel());
            }
            this.map.push(row);
        }
    };
    return WorldModel;
})();
exports.WorldModel = WorldModel;
var WorldCellModel = (function () {
    function WorldCellModel() {
        this.type = WorldCellType.empty;
    }
    Object.defineProperty(WorldCellModel.prototype, "text", {
        get: function () {
            if (this.type == WorldCellType.bot) {
                return this.bot.health.toString();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WorldCellModel.prototype, "cls", {
        get: function () {
            return WorldCellType[this.type];
        },
        enumerable: true,
        configurable: true
    });
    return WorldCellModel;
})();
exports.WorldCellModel = WorldCellModel;
(function (WorldCellType) {
    WorldCellType[WorldCellType["empty"] = 0] = "empty";
    WorldCellType[WorldCellType["eating"] = 1] = "eating";
    WorldCellType[WorldCellType["bot"] = 2] = "bot";
    WorldCellType[WorldCellType["wall"] = 3] = "wall";
    WorldCellType[WorldCellType["poison"] = 4] = "poison";
})(exports.WorldCellType || (exports.WorldCellType = {}));
var WorldCellType = exports.WorldCellType;
var WorldBotState = (function () {
    function WorldBotState(genom) {
        this.genom = genom;
        this.health = 0;
        this.angle = 0;
        this.commandIndex = 0;
        this.health = 100;
    }
    Object.defineProperty(WorldBotState.prototype, "isDead", {
        get: function () {
            return this.health <= 0;
        },
        enumerable: true,
        configurable: true
    });
    WorldBotState.prototype.getCommand = function () {
        return this.genom.commands[this.commandIndex];
    };
    WorldBotState.prototype.addCommandAddr = function (addr) {
        this.commandIndex = (this.commandIndex + addr) % this.genom.commands.length;
    };
    return WorldBotState;
})();
exports.WorldBotState = WorldBotState;
var WorldCommand = (function () {
    function WorldCommand() {
    }
    return WorldCommand;
})();
exports.WorldCommand = WorldCommand;
var WorldSimSettings = (function () {
    function WorldSimSettings(config) {
        if (config === void 0) { config = {}; }
        this.botMemoryLength = 64;
        this.botCount = 64;
        this.width = 64;
        this.height = 48;
        this.eatingPercent = 0.05;
        this.poisonPercent = 0.05;
        this.wallPercent = 0.1;
        this.stepCount = 10000;
        this.longSee = true;
        this.mutantPercent = 0.5;
        this.mutantCellPercent = 0.1;
        this.newGenerationTopPercent = 0.2;
        Object.assign(this, config);
    }
    return WorldSimSettings;
})();
exports.WorldSimSettings = WorldSimSettings;
