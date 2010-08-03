git clone git://github.com/tuxychandru/grasshopper.git \
    && cd grasshopper \
    && git submodule update --init \
    && cd grasshopper \
    && sudo npm install . \
    && cd ../.. \
    && rm -rf grasshopper \
    && echo 'Installed grasshopper.' \
