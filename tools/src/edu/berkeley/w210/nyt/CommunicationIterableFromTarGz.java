package edu.berkeley.w210.nyt;

import edu.jhu.hlt.concrete.Communication;

import java.io.File;
import java.io.IOException;
import java.util.Iterator;

public class CommunicationIterableFromTarGz implements Iterable<Communication> {

    private final File _file;

    public CommunicationIterableFromTarGz(File tarGzFile) {
        _file = tarGzFile;
    }

    @Override
    public Iterator<Communication> iterator() {
        try {
            return new CommunicationIteratorFromTarGz(_file);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
