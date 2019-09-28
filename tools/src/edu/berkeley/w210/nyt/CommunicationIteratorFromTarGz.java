package edu.berkeley.w210.nyt;

import edu.jhu.hlt.concrete.Communication;
import edu.jhu.hlt.concrete.serialization.CompactCommunicationSerializer;
import edu.jhu.hlt.concrete.util.ConcreteException;
import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Iterator;
import java.util.zip.GZIPInputStream;

public class CommunicationIteratorFromTarGz implements Iterator<Communication> {

    private final TarArchiveInputStream _input;
    private final CompactCommunicationSerializer _serializer = new CompactCommunicationSerializer();
    private TarArchiveEntry _entry;

    public CommunicationIteratorFromTarGz(File tarGzFile) throws IOException {
         _input = new TarArchiveInputStream(new GZIPInputStream(new FileInputStream(tarGzFile)));
        stepToNextFileEntry();
    }

    private void stepToNextFileEntry() throws IOException {
        _entry = _input.getNextTarEntry();
        while (_entry != null && !_entry.isFile()) {
            _entry = _input.getNextTarEntry();
        }
        if (_entry == null) {
            _input.close();
        }
    }

    @Override
    public boolean hasNext() {
        return _entry != null;
    }

    @Override
    public Communication next() {
        try {
            Communication result = _serializer.fromInputStream(_input);
            stepToNextFileEntry();
            return result;
        } catch (ConcreteException | IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void close() throws IOException {
        _input.close();
        _entry = null;
    }
}
